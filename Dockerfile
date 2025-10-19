FROM ollama/ollama:latest

# Expose the Ollama port
EXPOSE 11434

# Create startup script
RUN echo '#!/bin/bash\n\
ollama serve & \n\
sleep 10\n\
ollama pull llama2\n\
wait' > /start.sh && chmod +x /start.sh

# Start Ollama server and pull model
CMD ["/start.sh"]
