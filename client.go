package main

import (
	"net"
	"fmt"
	"os"
	"bufio"
	"time"
	"io"
	"encoding/json"

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

func onMessage(conn net.Conn) {
	for {
		reader := bufio.NewReader(conn)
		msg, _ := reader.ReadString('\n')

		var obj Orders
    err := json.Unmarshal([]byte(msg), &obj)
    if err != nil {
          fmt.Println("error json:", err)
          break
    }else{
    	fmt.Print("Revice : ",msg)
    	sendMT4(msg)
    }
		
	}
}

func sendMT4(msg string){

	f, _ := os.Open("servermt4.txt")
    // Create a new Scanner for the file.
    scanner := bufio.NewScanner(f)
    // Loop over all lines in the file and print them.
    for scanner.Scan() {
      line := scanner.Text()
      fmt.Println(line)
        d := net.Dialer{Timeout: 2}
        connection, err := d.Dial("tcp", line)
	    if err == nil {
	    	fmt.Print("Send :  to ",line)
		    connection.Write([]byte(msg))
		    connection.Close()
	    }
	    
    }
	
}

func main() {
	var connection net.Conn
	connection = tcpReconnect()
	go onMessage(connection)
}


func tcpReconnect() net.Conn {
    newConn, err := net.Dial("tcp", "34.136.218.30:9090")
    
    if err != nil {

        fmt.Println("Failed to reconnect:", err.Error())
        time.Sleep(time.Millisecond * time.Duration(1000))
        newConn = tcpReconnect()
    }
    return newConn
}
