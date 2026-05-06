package org.example.mazadat.Repository;

import org.example.mazadat.Model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(Integer userId);

    long countByUserIdAndReadFalse(Integer userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user.id = :userId AND n.read = false")
    void markAllAsReadByUserId(@Param("userId") Integer userId);

    boolean existsByUserIdAndTypeAndLink(Integer userId, String type, String link);

    void deleteByUserId(Integer userId);
}
