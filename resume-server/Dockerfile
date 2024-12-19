FROM python:3.9-slim AS builder

WORKDIR /app

COPY requirements.txt .

# Install dependencies
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Package app into a binary
COPY . .
RUN pip install pyinstaller && pyinstaller --onefile main.py

RUN apt-get remove -y gcc && apt-get autoremove -y && rm -rf /var/lib/apt/lists/*

FROM gcr.io/distroless/base

COPY --from=builder /app/dist/main /

EXPOSE 8000

CMD ["/main"]
