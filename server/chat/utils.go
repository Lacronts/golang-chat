package chat

import (
	"fmt"
	"math/rand"
	"time"
)

// RGBColor RBG Color Type
type RGBColor struct {
	Red   int
	Green int
	Blue  int
}

// GetRandomColorInRgb Returns a random RGBColor
func GetRandomColorInRgb() string {
	rand.Seed(time.Now().UnixNano())
	Red := rand.Intn(155)
	Green := rand.Intn(55)
	blue := rand.Intn(155)
	c := RGBColor{Red, Green, blue}
	return c.String()
}

func (c RGBColor) String() string {
	return fmt.Sprintf("%d,%d,%d", c.Red, c.Green, c.Blue)
}
