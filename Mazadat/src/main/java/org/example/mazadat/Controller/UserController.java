package org.example.mazadat.Controller;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;



    @GetMapping("/get/all")
    public ResponseEntity<?> getAllUserDTOS(){
        return ResponseEntity.status(HttpStatus.OK.value()).body(userService.getAllUserDTOS());
    }

}
