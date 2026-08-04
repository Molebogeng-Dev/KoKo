package co.za.KoKoApp.Rests.repository;

import co.za.KoKoApp.Rests.model.user;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface userRepository extends JpaRepository<user, Long> {

    /**Both are Spring Data JPA "derived query" methods
     - Spring generates the actual SQL from the method name, no implementation needed here.

     existsByEmail / existsByPhone:
     used at registration to reject duplicate sign-ups before ever touching the database with an INSERT.
     **/
    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    // findByEmail: not used yet this iteration (that's the login step),
    // but included now since it's the same natural lookup and costs
    // nothing to have ready.
    Optional<user> findByEmail(String email);
}