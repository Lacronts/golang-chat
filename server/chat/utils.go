package chat

import (
	"fmt"
	"math/rand"
	"time"
)

//RGBColor - RBG Color struct.
type RGBColor struct {
	Red   int
	Green int
	Blue  int
}

//GetRandomColorInRgb - Returns a random RGBColor.
func GetRandomColorInRgb() string {
	rand.Seed(time.Now().UnixNano())
	Red := 255 - rand.Intn(100)
	Green := 255 - rand.Intn(100)
	blue := 255 - rand.Intn(100)
	c := RGBColor{Red, Green, blue}
	return c.String()
}

func (c RGBColor) String() string {
	return fmt.Sprintf("%d,%d,%d", c.Red, c.Green, c.Blue)
}
