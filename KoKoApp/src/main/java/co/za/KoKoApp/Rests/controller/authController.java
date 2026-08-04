package co.za.KoKoApp.Rests.controller;

import co.za.KoKoApp.Rests.dataTransferObjects.registerRequest;
import co.za.KoKoApp.Rests.model.user;
import co.za.KoKoApp.Rests.repository.userRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
public class authController {

    /**
     * Matches a standard email shape: local part up to 64 chars, no
     * leading/trailing/double dots, domain with at least one dot and a
     * 2+ letter TLD, whole address capped at 254 chars total.
     **/
    private static final Pattern EMAIL_PATTERN = Pattern.compile(
            "^(?=.{1,254}$)(?=.{1,64}@)(?!.*\\.\\.)[A-Za-z0-9](?:[A-Za-z0-9._%+-]{0,62}[A-Za-z0-9])?@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\\.[A-Za-z]{2,})+$"
    );

    /**
     * Matches a South African local number AFTER the +27 country code -
     * 9 digits, first digit not zero (that's the international-format
     * convention: the leading 0 used for domestic dialing is dropped
     * once +27 is present). auth.js sends phone as "+27" + this part
     * concatenated, so we strip the +27 prefix before matching.
     **/
    private static final Pattern SA_PHONE_PATTERN = Pattern.compile("^[1-9]\\d{8}$");

    /**
     * Requires at least one lowercase letter, one uppercase letter, one
     * digit, one special character, and an overall length of 8-128.
     **/
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?`~]).{8,128}$"
    );

    private final userRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public authController(userRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody registerRequest request) {

        Map<String, Object> response = new HashMap<>();

        // ---- Required-field checks ----
        /** This only checks that nothing is missing/blank.
         Format validation (email shape, SA phone shape, password strength)
         happens right after this block, via the regex patterns above.
         **/
        if (isBlank(request.getName()) || isBlank(request.getSurname())
                || isBlank(request.getPhone()) || isBlank(request.getEmail())
                || isBlank(request.getPassword()) || isBlank(request.getConfirmPassword())
                || isBlank(request.getAddress()) || isBlank(request.getSuburb())
                || isBlank(request.getProvince()) || isBlank(request.getPostalCode())) {
            response.put("message", "All fields are required.");
            return ResponseEntity.badRequest().body(response);
        }

        if (!EMAIL_PATTERN.matcher(request.getEmail()).matches()) {
            response.put("message", "Enter a valid email address.");
            return ResponseEntity.badRequest().body(response);
        }

        if (!isValidSaPhone(request.getPhone())) {
            response.put("message", "Enter a valid South African phone number.");
            return ResponseEntity.badRequest().body(response);
        }

        if (!PASSWORD_PATTERN.matcher(request.getPassword()).matches()) {
            response.put("message", "Password must be 8+ characters and include an uppercase letter, a lowercase letter, a number, and a special character.");
            return ResponseEntity.badRequest().body(response);
        }

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            response.put("message", "Passwords do not match.");
            return ResponseEntity.badRequest().body(response);
        }

        // ---- Duplicate checks ----
        /** Checked here first so we can return a clean, specific message.
         The DB's own unique constraints (see catch block below) are the real backstop against a race condition
         where two requests for the same email/phone land at almost the same moment.
         **/
        if (userRepository.existsByEmail(request.getEmail())) {
            response.put("message", "An account with this email already exists.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            response.put("message", "An account with this phone number already exists.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        // ---- Build and save the user ----
        user user = new user();
        user.setName(request.getName());
        user.setSurname(request.getSurname());
        user.setPhone(request.getPhone());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setAddress(request.getAddress());
        user.setSuburb(request.getSuburb());
        user.setProvince(request.getProvince());
        user.setPostalCode(request.getPostalCode());
        // photoUrl stays null - Cloudflare R2 upload isn't wired up yet
        // verified stays false - email verification isn't wired up yet

        try {
            user saved = userRepository.save(user);

            response.put("message", "Registration successful.");
            response.put("userId", saved.getId());
            response.put("email", saved.getEmail());

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (DataIntegrityViolationException e) {
            /** Backstop for the race-condition case above
             - the DB's own unique constraints on email/phone caught something the existsBy checks above didn't
             (two near-simultaneous requests).
             **/
            response.put("message", "An account with this email or phone number already exists.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    /**
     * auth.js always sends the phone number as "+27" followed by the
     * local digits (that's the only country code offered right now), so
     * this checks the prefix explicitly and then matches the rest
     * against the SA local-number pattern above.
     **/
    private boolean isValidSaPhone(String phone) {
        if (phone == null || !phone.startsWith("+27")) {
            return false;
        }
        return SA_PHONE_PATTERN.matcher(phone.substring(3)).matches();
    }
}