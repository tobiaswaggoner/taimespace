FROM python:3.11.8-alpine

WORKDIR /app

COPY requirements.txt .

RUN pip install -r requirements.txt 

COPY . /app

EXPOSE 5000

# Run npm start script
CMD ["python", "-m", "agents.SimpleAgent.main"]