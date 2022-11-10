#include <DHT.h>
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <NTPClient.h>
#include <WiFiUdp.h>

/**
Susmit Singh {SUMO PRO MAX}
 - humidity sensor connected to digital Pin D2
 - Gas sensor connected to analog pin A0
**/

// Function that gets current epoch time
unsigned long getTime() {
  WiFiUDP ntpUDP;
  NTPClient timeClient(ntpUDP, "pool.ntp.org");

  timeClient.update();
  unsigned long now = timeClient.getEpochTime();
  return now;
}

//credentials
String ssid = "Susmit's Phone";
String password = "bruh 1212";

//local network (PRIVATE)
String server = "http://192.168.217.164:4050/api";
String SensorID = "1";

#define DHTPIN D2
#define GASPIN A0
#define DHTTYPE DHT11

DHT dht(DHTPIN, DHTTYPE);

unsigned long last_time = 0;
unsigned long timer_delay = 10000;
WiFiClient wifiClient;

void setup() {

  Serial.begin(9600);
  dht.begin();

  WiFi.begin(ssid, password);
  Serial.println("Connecting to WIFI..");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("[INFO] WIFI CONNECTED");
  Serial.println("[INFO] IP ADDRESS: ");
  Serial.println(WiFi.localIP());

  delay(1500);
}

void loop() {
  //This will send a post request every 1 minute (60 sec)

  if ((millis() - last_time) >= timer_delay) {
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;

      http.begin(wifiClient, server);

      float gas = analogRead(GASPIN); // read the gas data
      if (isnan(gas)) {
        Serial.println("[ERROR] Failed to read gas data from MQ-4");
        return;
      }

      float h = dht.readHumidity(); // read humidity (%)
      float t = dht.readTemperature(); // read temperature (C)

      if (isnan(h) || isnan(t)) {
        Serial.println(F("[ERROR] Failed to read from DHT sensor!"));
        return;
      }

      Serial.print(F("[INFO] Humidity: "));
      Serial.print(h);
      Serial.print(F("%  Temperature: "));
      Serial.print(t);
      Serial.print(F("C "));
      Serial.print(" Gas Level: ");
      Serial.println(gas);

      Serial.println("");

      String serverPath = server + "?temperature=" + String(t , 3) + "&humidity=" + String(h , 3) + "&gasConcentration=" + String(gas , 3) + "&timeStamp=" + String(getTime()) + "&SensorID=" + String(SensorID);

      http.begin(wifiClient , serverPath.c_str());

      int httpResponseCode = http.GET();

      if (httpResponseCode > 0) {

        Serial.print("[INFO] HTTP Response code: ");
        Serial.println(httpResponseCode);
      }
      else {
        Serial.print("[ERROR] Error code: ");
        Serial.println(httpResponseCode);
      }

      http.end();
    } else {  
      delay(5000);
    }

    last_time = millis();
  }
}
