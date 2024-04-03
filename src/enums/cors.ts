export function getCors(){
    return ({
        origin: ['http://localhost:3000', 'http://localhost:3100'],
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type']
      })
}