package main
import (
    "bufio"
    "fmt"
    "log"
    "net"
    //"strings"
    "sync"
    "github.com/google/uuid"
)

func handleConnection(id string, conn net.Conn, connMap *sync.Map) {
    

    
    scanner := bufio.NewScanner(conn)
    for scanner.Scan() {
        message := scanner.Text()
        fmt.Println("Received:",id," ", message)
        //newMessage := strings.ToUpper(message)
        //conn.Write([]byte(newMessage + "\n"))

        connMap.Range(func(key, value interface{}) bool {
          
          if key != id{
            
            connClient, ok := value.(net.Conn); 
            if ok {
              _, err := connClient.Write([]byte(message)); 
              if err != nil {
                connMap.Delete(key)
                fmt.Println("Error:",key)

              }else{
                fmt.Println("Send:",key)
              }
            }
          }
          

          return true
        })
        defer func() {
          conn.Close()
          connMap.Delete(id)
        }()
    }

    if err := scanner.Err(); err != nil {
        fmt.Println("error:", err)
    }
}

func main() {
    ln, err := net.Listen("tcp", "127.0.0.1:9090")
    if err != nil {
        log.Fatal(err)
    }

    defer ln.Close()
    fmt.Println("Accept connection on port")
    var connMap = &sync.Map{}
    
    for {
        conn, err := ln.Accept()
        if err != nil {
            log.Fatal(err)
        }
        id := uuid.New().String()
        connMap.Store(id, conn)

        fmt.Println("Client ID :",id)
        go handleConnection(id, conn, connMap)
    }
}