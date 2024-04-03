export enum Method {GET="GET", POST="POST"}

export function getCors(method : Method){
    return ({
        origin: ['http://localhost:3000', 'http://localhost:3100'],
        methods: ['GET'],
        allowedHeaders: ['Content-Type']
      })
}