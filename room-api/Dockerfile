FROM rust:1.62 AS builder

WORKDIR /usr/src/room-api
COPY . .
RUN cargo install --path .

FROM debian:11-slim AS final
RUN apt-get update && apt-get install -y ca-certificates tzdata && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/room-api /usr/local/bin/room-api
CMD ["room-api"]