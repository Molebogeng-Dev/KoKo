package co.za.KoKoApp.Rests.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class controller {

    @GetMapping({"/","/home"})
    public String index(){
        return "home/index";
    }

    @GetMapping("/login")
    public String login(){
        return "home/login";
    }

    @GetMapping("/register")
    public String register(){
        return "home/register";
    }

    @GetMapping("/user")
    public String userProfile(){
        return "profile/user";
    }

    @GetMapping("/business")
    public String businessProfile(){
        return "profile/business";
    }

    @GetMapping("/runner")
    public String runnerProfile(){
        return "profile/runner";
    }

    @GetMapping("/businesses")
    public String businessesDirectory(){
        return "profile/businesses";
    }
}