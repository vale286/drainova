#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>

// WiFi
const char* ssid = "POCO C75";
const char* password = "Vallen28";

// Endpoint Vercel
const char* serverName = "https://drainovaiot.vercel.app/api/data";

// Sensor pin
int pressurePin = 32;
volatile int pulseCount = 0;
float flowRate;
float pressureValue;
float voltage;
unsigned long lastFlowTime = 0;

// Hitung pulsa flow sensor
void IRAM_ATTR pulseCounter() {
  pulseCount++;
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("Menghubungkan ke WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n WiFi terhubung!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  pinMode(15, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(15), pulseCounter, FALLING);
  pinMode(pressurePin, INPUT);
}

void loop() {
  unsigned long currentMillis = millis();

  // Kirim data setiap 30 detik (30000 ms)
  if (currentMillis - lastFlowTime >= 30000) {
    detachInterrupt(digitalPinToInterrupt(15));

    flowRate = pulseCount / 7.5;  // L/min (1 pulse = 1/7.5 L/min)
    pulseCount = 0;
    lastFlowTime = currentMillis;

    attachInterrupt(digitalPinToInterrupt(15), pulseCounter, FALLING);

    int sensorValue = analogRead(pressurePin);
    voltage = sensorValue * (3.3 / 4095.0);
    pressureValue = (voltage - 0.5) * (174.0 / (4.5 - 0.5)); // PSI kalkulasi

    Serial.println("==============================");
    Serial.println("Data Sensor Drainova");
    Serial.print("Flow Rate : ");
    Serial.print(flowRate, 2);
    Serial.println(" L/min");
    Serial.print("Pressure  : ");
    Serial.print(pressureValue, 2);
    Serial.println(" PSI");
    Serial.println("Mengirim data ke server...");

    sendDataToServer(flowRate, pressureValue);
  }
}

void sendDataToServer(float flow, float pressure) {
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure client;
    client.setInsecure();  
    HTTPClient https;

    if (https.begin(client, serverName)) {
      https.addHeader("Content-Type", "application/json");

      String payload = "{\"pressure\":" + String(pressure, 2) +
                       ",\"flow\":" + String(flow, 2) + "}";

      int httpResponseCode = https.POST(payload);

      if (httpResponseCode > 0) {
        Serial.print("POST Response: ");
        Serial.println(httpResponseCode);
        Serial.println("Respon server: " + https.getString());
      } else {
        Serial.print("Gagal kirim! Code: ");
        Serial.println(httpResponseCode);
      }

      https.end();
    } else {
      Serial.println("Gagal memulai koneksi HTTPS.");
    }
  } else {
    Serial.println("WiFi Terputus. Mencoba Reconnect...");
    WiFi.reconnect();
  }
}
