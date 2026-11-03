# irha Voice Sandbox — product case study

Stage: independent prototype.

## Product contribution

An independent public sandbox for local speech transcription, service intake, clarification, quote review, and human handoff using fictional records.

Original domain framing, workflow and interface design, implementation with AI assistance, input validation, tests, and source-linked documentation. Foundation: https://github.com/livekit/agents.

## Verification

Local Whisper transcription and LiveKit toolset. The repository includes the relevant fixtures, tests, and retained reports.

## Tradeoffs and limits

A local English synthetic recording was transcribed successfully. The LiveKit Agent class and quote tool were instantiated, but no live room, telephony call, or external booking was tested. The browser microphone and local speech controls depend on browser support. This sandbox is not the commercial irha service implementation.

## Next product test

Connect a self-hosted LiveKit room and local STT/LLM/TTS, then measure turn latency, interruption handling, and task completion.
