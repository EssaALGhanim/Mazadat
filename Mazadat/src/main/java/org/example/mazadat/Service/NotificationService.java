package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.DTOOUT.NotificationDTOOUT;
import org.example.mazadat.Model.Notification;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public void createNotification(User user, String message, String messageAr, String type, String link) {
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        notification.setMessageAr(messageAr);
        notification.setType(type);
        notification.setLink(link);
        notificationRepository.save(notification);
    }

    public List<NotificationDTOOUT> getNotifications(Integer userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    public long getUnreadCount(Integer userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public void markAsRead(Integer notificationId, Integer userId) {
        notificationRepository.findById(notificationId).ifPresent(n -> {
            if (n.getUser().getId().equals(userId)) {
                n.setRead(true);
                notificationRepository.save(n);
            }
        });
    }

    @Transactional
    public void markAllAsRead(Integer userId) {
        notificationRepository.markAllAsReadByUserId(userId);
    }

    public boolean wonNotificationExists(Integer userId, Integer auctionId) {
        String link = "/auction/" + auctionId;
        return notificationRepository.existsByUserIdAndTypeAndLink(userId, "WON", link);
    }

    private NotificationDTOOUT toDto(Notification n) {
        return new NotificationDTOOUT(n.getId(), n.getMessage(), n.getMessageAr(), n.getType(), n.getLink(), n.isRead(), n.getCreatedAt());
    }
}
