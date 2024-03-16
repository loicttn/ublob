package indexer

import (
	"math/big"

	"github.com/ethereum/go-ethereum/common"
)

type CreditEvent struct {
	Creditee common.Address
	Amount   *big.Int
}

type CreditsRegistry map[common.Address]*big.Int

func NewCreditsRegistry() CreditsRegistry {
	return make(CreditsRegistry)
}

func (c CreditsRegistry) AddCredit(event CreditEvent) {
	if _, ok := c[event.Creditee]; !ok {
		c[event.Creditee] = new(big.Int)
	}
	c[event.Creditee].Add(c[event.Creditee], event.Amount)
}
