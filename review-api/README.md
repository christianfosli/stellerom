# Review API

Backend API for managing changing room reviews

### Running locally

Install rust development tools if needed.

Run a local mongodb instance (see ../docker-compose.yaml)

Start the service:

```
ALLOWED_IMAGE_BASE_URLS='["https://ststelleromdev.blob.core.windows.net/"]' \
ROOM_API_URL=http://localhost:3000 \
RUST_LOG=info \
cargo run
```
