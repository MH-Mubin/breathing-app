export default function LandingPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <section className="bg-dark card flex flex-col md:flex-row items-center justify-between p-8 md:p-12 mt-8 mb-8">
        <div className="flex-1 text-left text-light">
          <div className="mb-4">
            <span className="btn-primary px-3 py-1 text-sm">
              Welcome to Breathe
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Master Your Breath,
            <br />
            Transform Your Life
          </h1>
          <p className="mb-6 text-lg text-gray-200">
            Discover the power of rhythmic breathing. Reduce stress, improve
            focus, and boost your energy with guided breathing exercises
            designed for your well-being.
          </p>
          <div className="flex gap-3 mb-8">
            <a href="/practice" className="btn-primary px-5 py-2 text-lg">
              Start Breathing
            </a>
            <a href="#" className="btn-outline px-5 py-2 text-lg">
              Learn More
            </a>
          </div>
          <div className="flex gap-8 mt-6">
            <div className="text-center">
              <div className="text-xl font-bold orange">10k+</div>
              <div className="text-sm text-gray-300">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold orange">50k+</div>
              <div className="text-sm text-gray-300">Sessions Today</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold orange">4.9</div>
              <div className="text-sm text-gray-300">User Rating</div>
            </div>
          </div>
        </div>
        <div className="flex-1 center">
          <div className="relative w-72 h-72 center">
            <div
              className="absolute inset-0 rounded-full"
              style={{
                boxShadow: "0 0 0 32px #ff880033, 0 0 0 64px #ff880022",
              }}
            ></div>
            <div
              className="rounded-full center w-56 h-56"
              style={{
                background:
                  "radial-gradient(circle,#ff8800 60%,#ff880033 100%)",
                boxShadow: "0 0 32px #ff8800",
              }}
            >
              <span className="text-xl font-bold text-light">Breathe</span>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="text-center mb-6">
          <span className="btn-outline px-3 py-1 text-sm">Why Choose Us</span>
          <h2 className="text-2xl font-bold mt-2">
            Benefits of Regular Practice
          </h2>
          <p className="mt-2 text-gray-600">
            Experience transformative changes in your physical and mental
            well-being
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card p-6 text-center">
            <div className="orange text-3xl mb-2">🧡</div>
            <h3 className="font-semibold mb-1">Reduce Stress</h3>
            <p className="text-gray-500">
              Lower cortisol levels and activate your body's natural relaxation
              response
            </p>
          </div>
          <div className="card p-6 text-center">
            <div className="orange text-3xl mb-2">🧠</div>
            <h3 className="font-semibold mb-1">Improve Focus</h3>
            <p className="text-gray-500">
              Enhance mental clarity and concentration through mindful breathing
            </p>
          </div>
          <div className="card p-6 text-center">
            <div className="orange text-3xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">Boost Energy</h3>
            <p className="text-gray-500">
              Increase oxygen flow and vitality with energizing breath patterns
            </p>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="text-center mb-6">
          <span className="btn-outline px-3 py-1 text-sm">Simple Process</span>
          <h2 className="text-2xl font-bold mt-2">How It Works</h2>
        </div>
        <div className="steps mt-6">
          <div className="step">
            <div className="circle">1</div>
            <div className="font-semibold mt-4">Choose Your Pattern</div>
            <div className="text-gray-500 text-sm mt-2">
              Select from various breathing patterns designed for different
              goals
            </div>
          </div>
          <div className="line" aria-hidden />
          <div className="step">
            <div className="circle">2</div>
            <div className="font-semibold mt-4">Follow the Guide</div>
            <div className="text-gray-500 text-sm mt-2">
              Visual cues help you maintain the perfect rhythm and timing
            </div>
          </div>
          <div className="line" aria-hidden />
          <div className="step">
            <div className="circle">3</div>
            <div className="font-semibold mt-4">Track Progress</div>
            <div className="text-gray-500 text-sm mt-2">
              Monitor your journey and build consistency with detailed analytics
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">What Our Users Say</h2>
          <p className="mt-2 text-gray-600">
            Join thousands who transformed their lives
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-6 text-center">
              <div className="flex justify-center mb-2">
                {Array.from({ length: 5 }).map((_, j) => (
                  <span key={j} className="orange text-xl">
                    ★
                  </span>
                ))}
              </div>
              <div className="font-semibold mb-1">Sarah Johnson</div>
              <div className="text-gray-500 text-sm">Yoga Instructor</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-dark card p-8 md:p-12 text-center mb-8">
        <h2 className="text-2xl font-bold text-light mb-4">
          Ready to Start Your Journey?
        </h2>
        <p className="mb-6 text-gray-300">
          Join our community and experience the transformative power of
          breathwork
        </p>
        <a href="/practice" className="btn-primary px-6 py-3 text-lg">
          Begin Your Practice
        </a>
      </section>
    </div>
  );
}
