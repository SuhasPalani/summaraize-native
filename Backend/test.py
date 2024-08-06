import threading

def thread_function():
    pass

threads = []
try:
    for i in range(100000):  # Adjust the number as needed
        thread = threading.Thread(target=thread_function)
        thread.start()
        threads.append(thread)
except Exception as e:
    print(f"An error occurred: {e}")

print(f"Number of threads created: {len(threads)}")