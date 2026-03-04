import { Section } from "@/components/Section";

export function InfoSection() {
  return (
    <Section id="info" size="small" fullBleed aria-labelledby="info-heading">
      <div className="container info-layout">
        <div className="info-text">
          <h4 id="info-heading">Hi, I&apos;m Lyon</h4>
          <p>I am a freelance motion designer based in Austin, Texas and I love my job.</p>
          <p>
            Seriously, I can&apos;t believe I get to do this for a living. I&apos;ve met some great friends and worked
            on some incredible projects since starting in the industry in 2014. I&apos;ve been working freelance since
            2016 and before that I was working for two years on staff as a motion designer at a small shop here in
            Austin.
          </p>
          <p>
            These days, I work all sorts of different ways: direct to client, on site at a studio or agency, or as part
            of a remote team. All this has kept me on my toes and encouraged me to explore tons of different styles and
            workflows.
          </p>
          <p>
            With more than 10 years industry experience, I&apos;ve developed a reputation as a reliable and versatile
            motion designer working across 2D and 3D and spanning the roles of designer and animator. I am open to new
            freelance and full time opportunities.
          </p>
          <p>
            When I&apos;m not wrangling keyframes I&apos;m usually hanging out with my wife and daughters or making
            music. I play clarinet, tenor sax and guitar with the Relevators and Asleep at the Wheel and make my own
            electronic music. In a past life, I also produced a line of guitar effects pedals under the name Station
            Audio using acid etched graphics and found objects.
          </p>
          <p>
            See below for a list of my past clients and continue on to view a selection of my recent work.
          </p>
          <p>
            Whether you&apos;re looking for a freelance collaborator or full-service creative partner, I&apos;d love to
            talk about how I can help bring your next project to life. Let&apos;s connect.
          </p>
        </div>
        <div className="info-image">
          <img
            src="https://res.cloudinary.com/dax2qbori/image/upload/v1772049653/IMG_6413_vitoot.webp"
            alt="Portrait of Lyon"
            loading="lazy"
          />
        </div>
      </div>
      <div className="info-logos-wrap">
        <img
          className="info-logos"
          src="https://res.cloudinary.com/dax2qbori/image/upload/v1771961076/Logos_Row_Gray_3_dfax1q.png"
          alt="Past client logos"
          loading="lazy"
        />
      </div>
    </Section>
  );
}
