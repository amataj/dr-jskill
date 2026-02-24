# Project Structure

## frontend 

```
frontend-project-root/
├── src/               # frontend application
│   ├── index.html               # HTML entry point
│   ├── package.json                 # Node dependencies
│   └── .gitignore
└──  pom.xml 
```

## backend 
```
backend-project-root/            # Spring Boot application
├── src/
│   └── main/
│   ├── java/                    # Spring Boot backend
│   └── resources/
│   └──  pom.xml                 # pom for the bacend app
└── pom.xml                      # pom for the whole project
```

## backend and frontend in the webapp folder within the src
```
backend-project-root/            # Spring Boot application
├── src/
│   └── main/
│   ├── java/                    # Spring Boot backend
│   └── resources/
│   └── webapp/                   # frontend application source 
│   │   ├── index.html               # HTML entry point
│   │   ├── package.json                 # Node dependencies
│   │   ── .gitignore
│   └──  pom.xml                 # pom for the bacend app
└── pom.xml                      # pom for the whole project
```


## frontend and backend in the same level

```
project-root/
├── frontend/                    # frontend application
│   ├── src/
│   │   ├── index.html               # HTML entry point
│   │   ├── main.ts                  # Angular bootstrap
│   │   └── styles.css               # Global styles
│   ├── package.json                 # Node dependencies
│   └── .gitignore
│   └──  pom.xml                     # pom for the frontend app using the frontend Maven plugin
├── backend/                         # backend application
│   ├── src/
│   │   └── main/
│   │   ├── java/                    # Spring Boot backend
│   │   └── resources/
│   │      └── static/              # Production build output (auto-generated)
│   └──  pom.xml                    # pom for the bacend app
└── pom.xml                         # pom for the whole project
```
