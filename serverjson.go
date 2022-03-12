    package main
     
    import (
        "bufio"
        "fmt"
        "io"
        "log"
        "net"
        "net/http"
        "strings"
        "time"
        "github.com/google/uuid"
    )
     
    func main() {
        listener, err := net.Listen("tcp", "0.0.0.0:9999")
        if err != nil {
                log.Fatalln(err)
        }
        defer listener.Close()
     
        for {
                con, err := listener.Accept()
                if err != nil {
                        log.Println(err)
                        continue
                }
     
                go handleClientRequest(con)
        }
    }
     
    func handleClientRequest(con net.Conn) {
        defer con.Close()
     
        clientReader := bufio.NewReader(con)
     
        for {
                clientRequest, err := clientReader.ReadString('\n')
     
                switch err {
                case nil:
                        clientRequest := strings.TrimSpace(clientRequest)
                        if clientRequest == ":QUIT" {
                                log.Println("client requested server to close the connection so closing")
                                return
                        }
                case io.EOF:
                        log.Println("client closed the connection by terminating the process")
                        return
                default:
                        log.Printf("error: %v\n", err)
                        return
                }
     
                if _, err = con.Write(createResponse()); err != nil {
                        log.Printf("failed to respond to client: %v\n", err)
                }
        }
    }
     
    func createResponse() []byte {
        return []byte(
                fmt.Sprintf(`{"code":%d,"data":{"id":"%s","created_at":"%s"}}`+"\n",
                        http.StatusOK,
                        uuid.New().String(),
                        time.Now().UTC().Format(time.RFC3339),
                ),
        )
    }