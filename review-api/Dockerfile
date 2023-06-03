FROM rust:1.69 AS builder

WORKDIR /usr/src/review-api
COPY . .
RUN cargo install --path .

FROM debian:11-slim AS final
ARG RUST_LOG=info
ENV RUST_LOG=$RUST_LOG
RUN apt-get update && apt-get install -y ca-certificates tzdata && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/review-api /usr/local/bin/review-api
CMD ["review-api"]
