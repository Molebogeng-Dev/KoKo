package co.za.KoKoApp.Rests.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class controller {

    String homeFolder = "home";
    String profileFolder = "profile";

    @GetMapping({"/","/home"})
    public String index(){
        return homeFolder + "/index";
    }

    @GetMapping("/login")
    public String login(){
        return homeFolder + "/login";
    }

    @GetMapping("/register")
    public String register(){
        return homeFolder + "/register";
    }

    @GetMapping("/user")
    public String userProfile(){
        return profileFolder + "/user";
    }

    @GetMapping("/business")
    public String businessProfile(){
        return profileFolder + "/business";
    }

    @GetMapping("/runner")
    public String runnerProfile(){
        return profileFolder + "/runner";
    }

    @GetMapping("/businesses")
    public String businessesDirectory(){
        return "profile/businesses";
    }
}