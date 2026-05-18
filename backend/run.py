import uvicorn

if __name__ == "__main__":
    print("Starting Forest eOffice Productivity Monitoring System v2.0...")
    print("API docs: http://127.0.0.1:8000/api/docs")
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
    )
