package co.za.KoKoApp.Rests.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.UUID;

/**
 * Wraps the S3Client/S3Presigner beans (see R2Config) into the two
 * operations this app actually needs: uploading a photo, and generating
 * a short-lived link to view one. The bucket is kept private - these are
 * face photos tied to a real person's identity, so nothing here produces
 * a permanent public URL. Anything that needs to display a photo asks
 * this service for a presigned link instead.
 **/
@Service
public class photoStorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    @Value("${r2.bucket-name}")
    private String bucketName;

    public photoStorageService(S3Client s3Client, S3Presigner s3Presigner) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
    }

    /**
     * Uploads a photo and returns the storage key (not a public URL -
     * the bucket is private) to save on the User row. The key is a
     * random UUID rather than the original filename, so two people
     * uploading "photo.jpg" can never collide or overwrite each other.
     **/
    public String uploadPhoto(MultipartFile file) throws IOException {
        String key = "user-photos/" + UUID.randomUUID() + getExtension(file);

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .contentType(file.getContentType())
                .build();

        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

        return key;
    }

    // Turns a stored key back into a temporary, expiring link - used
    // whenever the app needs to actually display a photo (e.g. comparing
    // a live photo against what's on file at delivery time), rather than
    // handing out a permanent public URL.
    public String getPresignedUrl(String key, Duration expiry) {
        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(key)
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(expiry)
                .getObjectRequest(getObjectRequest)
                .build();

        return s3Presigner.presignGetObject(presignRequest).url().toString();
    }

    private String getExtension(MultipartFile file) {
        String original = file.getOriginalFilename();
        if (original != null && original.contains(".")) {
            return original.substring(original.lastIndexOf('.'));
        }
        return "";
    }
}