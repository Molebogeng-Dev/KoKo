# KoKo
Koko is a location-based service delivery platform built specifically for rural areas and townships in South Africa that are underserved by existing delivery services like Uber Eats and Mr D. The app allows users to discover local businesses near them using an interactive map, browse products, place orders, and track deliveries - for low-bandwidth 


#  Koko Frontend
A location-based service delivery app for rural South Africa.

KoKoApp/
├── pom.xml                                    (+ thymeleaf-layout-dialect)
├── src/main/java/co/za/KoKoApp/
│   ├── KoKoAppApplication.java
│   └── Rests/controller/controller.java       (routes: /, /home, /login, /register, /user, /business, /runner)
└── src/main/resources/
├── application.properties
├── static/
│   ├── css/style.css
│   ├── images/
│   │   ├── bgMain.png
│   │   ├── kokoLogo.png
│   │   ├── koko_banner
│   │   └── Daveyton-Main-Entrance-B.jpg    ← new, not referenced anywhere yet
│   └── js/
│       ├── api.js
│       ├── auth.js
│       └── Ui.js
└── templates/
├── layout.html                        ← NEW parent (header fragments + shared body)
├── index.html                         ← decorates layout, overrides nothing (guest header)
├── user.html                          ← decorates layout, overrides header only
├── business.html                      ← decorates layout, overrides header only
├── runner.html                        ← decorates layout, overrides header only
├── login.html                         ← standalone, NOT decorated
└── register.html                      ← standalone, NOT decorated


## Running in IntelliJ
1. Open this folder in IntelliJ IDEA
2. Open index.html
3. Click the browser icon (top right of editor)
4. Frontend runs at http://localhost:63342

## Backend
- Spring Boot must run on http://localhost:1620
- Add CorsConfig.java to your Spring Boot project
- Update BASE_URL in js/api.js if your port differs

## Payment (South Africa)
...

