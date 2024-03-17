package router

import (
	"github.com/gin-gonic/gin"

	"github.com/gin-contrib/cors"
	"github.com/kilnfi/ublob/relay/pkg/relay"
)

func NewRouter(relay *relay.Relay) *gin.Engine {
	r := gin.Default()

	r.Use(cors.Default())

	r.POST("/ublob", relay.CreateUBlobRequest)
	r.GET("/ublobs", relay.GetUBlobRequest)
	r.GET("/ublobs/:blobHash", relay.GetUblobsByID)
	r.GET("/blobs", relay.GetBlobs)

	return r
}
