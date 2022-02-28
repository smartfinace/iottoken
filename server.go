package main
import (
    "bufio"
    "fmt"
    "log"
    "net"
    "strings"
    "sync"
    "encoding/json"
    "github.com/google/uuid"
)

type Orders struct {
  symbol string
  cm string
  open int
  sl int
  tp int
  tp2 int
  tp3 int
  dca int
  dca2 int
  telegram int
}


func handleConnection(id string, conn net.Conn, connMap *sync.Map) {
    

      var strRemoteAddr = conn.RemoteAddr().String()
      s := strings.Split(strRemoteAddr, ":")
    
    
      scanner := bufio.NewScanner(conn)
      for scanner.Scan() {
          
            message := scanner.Text()
            fmt.Println("Received:",id," ", message," - ",s[0])
            var obj Orders
            err := json.Unmarshal([]byte(message), &obj)
            if err != nil {
                  fmt.Println("error json:", err)
                  break
            }
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
          fmt.Println("error connect:", err)
          conn.Close()
          connMap.Delete(id)
      }
    

}

func main() {
    ln, err := net.Listen("tcp", "0.0.0.0:9090")
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