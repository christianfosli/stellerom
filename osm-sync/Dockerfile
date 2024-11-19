FROM rust:1.82 AS builder

# Build context should be one folder up from normal, because we include a symlink under room-api
WORKDIR /usr/src
RUN mkdir -p room-api/src
COPY room-api/src/models.rs room-api/src/
COPY osm-sync osm-sync
WORKDIR /usr/src/osm-sync
RUN cargo install --path .

FROM debian:12-slim AS final
ARG RUST_LOG=info
ENV RUST_LOG=$RUST_LOG
RUN apt-get update && apt-get install -y ca-certificates tzdata && rm -rf /var/lib/apt/lists/*
COPY --from=builder /usr/local/cargo/bin/osm-sync /usr/local/bin/osm-sync
CMD ["osm-sync"]
