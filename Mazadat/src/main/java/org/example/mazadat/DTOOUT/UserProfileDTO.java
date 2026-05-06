package org.example.mazadat.DTOOUT;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UserProfileDTO {
    private Integer id;
    private String username;
    private String email;
    private String phoneNumber;
    private String role;
    private boolean phoneVerified;
}

