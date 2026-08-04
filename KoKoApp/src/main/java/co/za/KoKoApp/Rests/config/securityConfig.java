package co.za.KoKoApp.Rests.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class securityConfig {

    /** BCrypt is the standard choice for password hashing -
     it's slow by design (a good thing here), salts automatically,
     and is what Spring Security ships without of the box. **/
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }


    /** Just adding spring-boot-starter-security to the classpath makes
     Spring Security auto-lock every endpoint behind a login page by default
     - including the home page and static assets.
     We're not using Spring Security's session-based login at all
     (JWT is planned for a later step), so this permits every request through for now.
     **/
    // **Tighten this up once real JWT-based auth exists.**
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());

        return http.build();
    }
}