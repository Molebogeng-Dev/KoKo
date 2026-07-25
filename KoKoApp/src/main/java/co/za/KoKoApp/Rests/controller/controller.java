package co.za.KoKoApp.Rests.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class controller {

    @GetMapping({"/","/home"})
    public String index(){
        return "index";
    }

    @GetMapping("/login")
    public String login(){
        return "login";
    }

    @GetMapping("/register")
    public String register(){
        return "register";
    }

    @GetMapping("/user")
    public String userProfile(){
        return "user";
    }

    @GetMapping("/business")
    public String businessProfile(){
        return "business";
    }

    @GetMapping("/runner")
    public String runnerProfile(){
        return "runner";
    }
}