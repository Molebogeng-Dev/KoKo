package co.za.KoKoApp.Rests.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.net.URI;

/**
 * Configures the S3 client to talk to Cloudflare R2 instead of AWS.
 * R2 exposes an S3-compatible API, reachable at a per-account endpoint
 * of the form https://<account-id>.r2.cloudflarestorage.com - pointing
 * the standard AWS SDK at that URL (with region "auto", which R2 uses
 * in place of a real AWS region) is the entire integration. Same SDK,
 * same method calls, just a different endpoint underneath.
 **/
@Configuration
public class r2Config {

    @Value("${r2.account-id}")
    private String accountId;

    @Value("${r2.access-key-id}")
    private String accessKeyId;

    @Value("${r2.secret-access-key}")
    private String secretAccessKey;

    private String endpoint() {
        return "https://" + accountId + ".r2.cloudflarestorage.com";
    }

    private StaticCredentialsProvider credentials() {
        return StaticCredentialsProvider.create(
                AwsBasicCredentials.create(accessKeyId, secretAccessKey)
        );
    }

    // Used by PhotoStorageService for uploads
    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .endpointOverride(URI.create(endpoint()))
                .credentialsProvider(credentials())
                .region(Region.of("auto"))
                .build();
    }

    // Used by PhotoStorageService to generate short-lived view links -
    // separate client because presigning URLs is a distinct capability
    // from the regular request client in the AWS SDK.
    @Bean
    public S3Presigner s3Presigner() {
        return S3Presigner.builder()
                .endpointOverride(URI.create(endpoint()))
                .credentialsProvider(credentials())
                .region(Region.of("auto"))
                .build();
    }
}