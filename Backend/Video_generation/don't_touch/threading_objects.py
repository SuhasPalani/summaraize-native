import threading
import time

class Task:
    def __init__(self, name, duration):
        self.name = name
        self.duration = duration

    def run(self):
        print(f'Task {self.name} is starting.')
        time.sleep(self.duration)  # Simulating a time-consuming task
        result = f'{self.name} completed after {self.duration} seconds.'
        print(result)
        return result

def worker(task, results, index):
    result = task.run()
    results[index] = result

# Creating tasks with different durations
tasks = [
    Task('Task-1', 1),
    Task('Task-2', 2),
    Task('Task-3', 3),
    Task('Task-4', 4)
]

# Placeholder for results
results = [None] * len(tasks)

# Creating threads
threads = [threading.Thread(target=worker, args=(task, results, i)) for i, task in enumerate(tasks)]

# Starting threads
for thread in threads:
    thread.start()

# Waiting for all threads to complete
for thread in threads:
    thread.join()

# Print the collected results
print('All tasks are complete. Results:')
print(results)
