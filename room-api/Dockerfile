FROM rust:1.89 AS builder

WORKDIR /usr/src/room-api
RUN --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=Cargo.toml,target=Cargo.toml \
    --mount=type=bind,source=Cargo.lock,target=Cargo.lock \
    --mount=type=cache,target=target/ \
    --mount=type=cache,target=/usr/local/cargo/registry/ \
    cargo install --path .

FROM debian:12-slim AS final
ARG RUST_LOG=info
ENV RUST_LOG=$RUST_LOG
RUN apt-get update && apt-get install -y ca-certificates tzdata && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/room-api /usr/local/bin/room-api
CMD ["room-api"]
