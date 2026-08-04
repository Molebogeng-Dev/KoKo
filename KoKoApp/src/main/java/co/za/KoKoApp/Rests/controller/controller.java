package co.za.KoKoApp.Rests.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class controller {

    String homeFolder = "home";
    String profileFolder = "profile";

    //index page endpoint
    @GetMapping({"/","/home"})
    public String index(){
        return homeFolder + "/index";
    }


    //profiles endpoints
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

}