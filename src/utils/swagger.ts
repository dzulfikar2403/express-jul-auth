import swaggerJSDoc from "swagger-jsdoc";

const swaggerOptions = swaggerJSDoc({
    swaggerDefinition:{
        openapi: "3.0.0", 
        info:{
            title:"api docs",
            version:"1.0.0",
            description: "my own docs"
        },
        host: "localhost:3000"
    },
   apis:["./src/routes/*.routes.ts"] 
})

export default swaggerOptions;