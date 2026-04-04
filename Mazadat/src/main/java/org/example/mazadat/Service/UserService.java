package org.example.mazadat.Service;

import lombok.RequiredArgsConstructor;
import org.example.mazadat.Api.ApiException;
import org.example.mazadat.DTOOUT.UserDTOOUT;
import org.example.mazadat.Model.User;
import org.example.mazadat.Repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    // this is called Dependency injection, this will allow the service to access the User repo which is linked to the database table
    private final UserRepository userRepository;


    // always start with the CRUD methods as u need them most of the time as endpoints


    // I used DTO to choose what data I want to return, but it is optional, so you can use it when you need it. there is also DTOIN for adding
    public List<UserDTOOUT> getAllUserDTOS(){
        List<User> users = userRepository.findAll();
        List<UserDTOOUT> userDTOOUTS = new ArrayList<>();
        for (User user : users){
            UserDTOOUT userDTOOUT = new UserDTOOUT(user.getId(),user.getUsername(),user.getRole(),user.getCreatedAt(),user.getUpdatedAt());
            userDTOOUTS.add(userDTOOUT);
        }
        if (userDTOOUTS.isEmpty()){
            throw new ApiException("User array is empty");
        }
        return userDTOOUTS;
    }




}
