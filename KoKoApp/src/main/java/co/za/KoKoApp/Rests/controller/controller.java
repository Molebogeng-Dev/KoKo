package co.za.KoKoApp.Rests.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class controller {

    @GetMapping({"/","/home"})
    public String index(){
        return "index";
    }
}
