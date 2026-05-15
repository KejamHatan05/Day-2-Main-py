import sys
from time import sleep


BOLD_WHITE  = "\033[1;37m"
RESET       = "\033[0m"
HIDE_CURSOR = "\033[?25l"
SHOW_CURSOR = "\033[?25h"


def write(text):
    sys.stdout.write(text)
    sys.stdout.flush()


def printLyrics():
    lines = [
        ("We gonna party like it's 3012 tonight", 0.07),
        ("I wanna show you all the finer things in life", 0.07),
        ("So just forget about the world, we young tonight", 0.07),
        ("I'm coming for ya, I'm coming for ya", 0.07),
        ("Cause all...", 0.15),
        ("I need", 0.15),
        ("Is a beauty and a beat", 0.13),
        ("Who can make my life complete", 0.13),
        ("It's all...", 0.15),
        ("'bout you", 0.15),
        ("When the music makes you move", 0.11),
        ("Baby, do it like you do", 0.11),
    ]


    delays = [0.6, 0.6, 0.4, 0.4, 1.5, 0.6, 0.6, 1.5, 2.0, 0.6, 0.6, 0.6]

    write(HIDE_CURSOR)

    try:
        for i, (line, char_delay) in enumerate(lines):
            for char in line:
                write(f"{BOLD_WHITE}{char}{RESET}")
                sleep(char_delay)

            write("\n")

            sleep(delays[i])

        sleep(3)

    except KeyboardInterrupt:
        write("\n")

    finally:
        write(SHOW_CURSOR)

printLyrics()
