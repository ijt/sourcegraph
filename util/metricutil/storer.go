package metricutil

import (
	"fmt"
	"time"

	"golang.org/x/net/context"
	"gopkg.in/inconshreveable/log15.v2"

	"github.com/mattbaird/elastigo/lib"

	"src.sourcegraph.com/sourcegraph/go-sourcegraph/sourcegraph"
)

var storage *elastigo.BulkIndexer

func startEventStorer(ctx context.Context) {
	url := config.StoreURL
	if url == "" {
		log15.Debug("EventStorer failed to locate elasticsearch endpoint")
		return
	}

	conn := elastigo.NewConn()
	conn.SetFromUrl(url)

	storage = conn.NewBulkIndexerErrors(10, 60)
	if storage == nil {
		log15.Error("EventStorer could not connect to elasticsearch")
		return
	}
	storage.Start()

	go func() {
		for errBuf := range storage.ErrorChannel {
			log15.Error("EventStorer recieved error", "error", errBuf.Err)
		}
	}()

	log15.Debug("EventStorer initialized")
}

func StoreEvents(ctx context.Context, eventList *sourcegraph.UserEventList) {
	indexName := getIndexNameWithSuffix()
	if storage != nil {
		for _, event := range eventList.Events {
			indexNameWithPrefix := indexName
			if event.Version == "dev" {
				indexNameWithPrefix = "dev-" + indexNameWithPrefix
			}
			if err := storage.Index(indexNameWithPrefix, "user_event", "", "", "", nil, event); err != nil {
				log15.Error("EventStorer failed to push event", "event", event, "error", err)
			}
		}
	}
}

func getIndexNameWithSuffix() string {
	t := time.Now().UTC()
	return fmt.Sprintf("events-%d-%02d-%02d", t.Year(), t.Month(), t.Day())
}
