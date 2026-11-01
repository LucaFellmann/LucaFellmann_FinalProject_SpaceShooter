
/*
 * SPACE SHOOTER CONTROLLER
 * Sends the state of three buttons to the browser.
 */

void setup() {
  Serial.begin(9600);

  // Set up the three buttons
  pinMode(2, INPUT_PULLUP);
  pinMode(3, INPUT_PULLUP);
  pinMode(4, INPUT_PULLUP);
}

void loop() {
  // Read each button
  int left = digitalRead(2);
  int shoot = digitalRead(3);
  int right = digitalRead(4);

  // Send button states separated by commas
  Serial.print(left);
  Serial.print(",");
  Serial.print(shoot);
  Serial.print(",");
  Serial.println(right);

  delay(20);
}
