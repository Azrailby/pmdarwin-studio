from manim import *
import numpy as np
config.background_color = "#04070b"
ACC = "#ff5a2a"

class KaraDelik(Scene):
    def construct(self):
        # warped space-time grid bending into a black hole
        def warp(p):
            x, y, z = p; cy = 0.8; dy = y - cy; r2 = x * x + dy * dy
            k = 1 - 1.7 / (r2 + 2.0)
            return np.array([x * k, cy + dy * k, 0])
        grid = NumberPlane(x_range=[-9, 9, 0.6], y_range=[-5, 5, 0.6],
                           background_line_style={"stroke_color": "#2a5a7a", "stroke_width": 1.4, "stroke_opacity": 0.7},
                           axis_config={"stroke_opacity": 0})
        grid.prepare_for_nonlinear_transform()
        hole = Circle(radius=0.9, fill_color=BLACK, fill_opacity=1, stroke_color=ACC, stroke_width=6).move_to([0, 0.8, 0])
        glow = VGroup(*[Circle(radius=0.9 + i * 0.1, stroke_color=ACC, stroke_opacity=0.5 - i * 0.06, stroke_width=4) for i in range(7)]).move_to([0, 0.8, 0])
        self.add(grid)
        self.play(grid.animate.apply_function(warp), FadeIn(glow), GrowFromCenter(hole), run_time=3)
        # astronaut-like capsule falls in and gets stretched (spaghettification)
        body = RoundedRectangle(corner_radius=0.18, width=0.8, height=1.5, fill_color="#e8e2d6", fill_opacity=1, stroke_width=0).move_to([5.2, 2.6, 0])
        visor = Circle(radius=0.24, fill_color="#3a7bd5", fill_opacity=1, stroke_width=0).move_to(body.get_top() + DOWN * 0.38)
        astro = VGroup(body, visor)
        self.play(FadeIn(astro), run_time=0.6)
        path = ArcBetweenPoints(astro.get_center(), [1.5, 1.2, 0], angle=-TAU / 6)
        self.play(MoveAlongPath(astro, path), astro.animate.rotate(-PI / 3), Rotate(glow, PI / 2), run_time=3, rate_func=rate_functions.ease_in_quad)
        self.play(astro.animate.stretch(3.2, 1).stretch(0.25, 0).rotate(-PI / 5).set_opacity(0.85), run_time=1.6)
        self.play(astro.animate.move_to([0, 0.8, 0]).scale(0.05).set_opacity(0), Flash(hole, color=ACC, line_length=0.6, num_lines=16), run_time=1.4)
        self.wait(0.5)
