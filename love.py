import math
import turtle

screen = turtle.Screen()
screen.bgcolor("black")
screen.title("❤️")

t = turtle.Turtle()
t.hideturtle()
t.speed(0)
t.width(2)

def heart(scale, color):
    t.color(color)
    t.begin_fill()
    for i in range(360):
        x = scale * 16 * math.sin(math.radians(i)) ** 3
        y = scale * (
            13 * math.cos(math.radians(i))
            - 5 * math.cos(math.radians(2 * i))
            - 2 * math.cos(math.radians(3 * i))
            - math.cos(math.radians(4 * i))
        )
        t.goto(x, y)
    t.end_fill()


for s in range(18, 13, -1):
    t.penup()
    t.goto(0, -10)
    t.pendown()
    t.width(2)
    heart(s, "#330000")


t.penup()
t.goto(0, -10)
t.pendown()
heart(14, "#ff1a1a")


t.penup()
t.goto(0, -170)
t.color("#ffffff")
t.write(
    "Saya Akan Lawan",
    align="center",
    font=("plus Jakarta Sans", 24, "bold")
)

turtle.done()
