import logger from "pino"

const log = logger({
    transport:{
        target: "pino-pretty"
    }
})

export default log;