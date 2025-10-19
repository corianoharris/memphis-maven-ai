FROM ollama/ollama:latest

# Expose the Ollama port
EXPOSE 11434

# Start Ollama server
CMD ["ollama", "serve"]
