#!/bin/bash

# Infinite loop to send a request every second
while true; do
    # Generate a random size between 1KB and 10KB (1024 to 10240 bytes)
    # Then, since each hex character represents half a byte, divide by 2 to get the number of hex characters
    size=$((RANDOM % (30240 - 1024 + 1) + 10000))
    hexSize=$(($size / 2))

    # Generate a random hex string of the calculated size
    data=$(openssl rand -hex $hexSize)

    # Payload with the generated random data and other fixed values
    payload=$(cat <<EOF
{
    "data": "0x$data",
    "sender": "0xBaFe8474D47E47F27e0bd72e57432B8020dc0E22",
    "signature": "0xabcd",
    "maxWeiPerByte": "1234000",
    "ageFactor": 10000,
    "expirationTimestamp": 17105945390
}
EOF
)

    # Send the POST request with the payload
    curl -X POST "http://localhost:8080/ublob" -H "Content-Type: application/json" -d "$payload"

    # Generate a random sleep duration between 1 and 5 seconds
    sleepTime=$((RANDOM % 10 + 1))

    # Sleep for the random duration before the next iteration
    sleep $sleepTime
done
