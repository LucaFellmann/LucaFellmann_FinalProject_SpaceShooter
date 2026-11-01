
## Schematic View

<picture>
    <img
        src="Images/schematic-view.png"
        alt="Schematic view of the Arduino controller"
        height="360"
        width="640"
    />
</picture>


## Arduino Controller

The Space Shooter game can be controlled using three physical push buttons connected to an Arduino UNO. The red button (D2) moves the spaceship left, the black button (D3) shoots bullets, and the green button (D4) moves the spaceship right.

The buttons use `INPUT_PULLUP`, meaning they return HIGH (1) when released and LOW (0) when pressed. The Arduino reads the button states every 20 milliseconds and sends them to the computer through USB using serial communication at 9600 baud.

The game uses the **Web Serial API** to receive these values in Google Chrome. JavaScript processes the incoming data and translates button presses into movement and shooting actions. The original keyboard controls remain available as an alternative. They are left arrow to go left right arrow to go right and space to shoot. 


## Moodboard

<picture>
    <img
        src="Images/moodboard.png"
        alt="Moodboard for Fight for the Universe"
        width="1024"
        height="768"
    />
</picture>


## Figma UI

[Figma UI ↗](https://www.figma.com/design/ipfHWDDEjTYDDyfGYmzjur/LucaFellmann-WebProject?node-id=14-199&t=oOxm1jKuoyxP8VCr-1)

