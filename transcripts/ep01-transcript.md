[00:00:00] **Jason Hand:** We should probably explain a little bit about what this is. I'm Jason, and this is Ryan. We are on the advocacy team at Datadog, and have recently had some conversations around, best ways for us to both, Stay on top of the very rapidly changing AI space, which is part of what we do for work, but also help educate those around us within advocacy, within just engineering at Datadog, but maybe even in, broader sense, just helping developers at large on What we discover and what we learn about some of these AI tools, as we go through them and, take time to share that out with everybody instead of, hoarding that information.

I think Ryan and I both agree. It's really important for people to educate themselves on a lot of these things, not just to find out how they can help you in your day to day job, but also make sure we're keeping everybody safe and doing the right thing, 

[00:00:59] **Ryan MacLean:** and people ask me [00:01:00] questions about this stuff all the time. I feel like I've missed something if I haven't heard about the tool they're talking about, there's always surprises for me at least.

[00:01:06] **Jason Hand:** Yeah. Every morning I spend time watching videos on YouTube and trying to just make sure I'm plugged in. And then I take a note. Of like an app or a new service that I've heard of and then that goes into my list of things. I want to eventually go make time to check out. This is that intentionality of okay, I'm going to set aside some time.

I'm going to go through this list of tools and actually get my hands on keyboards and play with them so that I can form my own opinion and then help other people understand what they are. So actually, I've got a list here. I'll switch over to my screen. All right. Because, Ryan and I have, separate lists that we're gonna merge into this repo, which is just on github, dot com.

If you go to my github, and then AI tools experiments. We'll update this with both of our stuff, but I've started putting in just a few things that I've heard about. And I've started categorizing a lot of them. Some of them are just AI, I'll say, [00:02:00] adjacent.

Whereas, some of the automation tools that I've played with or have heard about that I wanted to play with, they aren't AI tools by themselves, but they plug in and play well with others and, the agents, the agentic model of AI and LLMs and all that kind of stuff is where they're excelling right now.

So long story short, we've got a great list of tools that we want to go play with. Ryan's got his. We're going to go over Ryan, his first tool today. You want to share anything else or just dive into the tool that you've picked out 

[00:02:29] **Ryan MacLean:** The long and the short of it is I've been working on, I guess you would call them image generation models. So multimodal in that you will typically give them text and the model will give you back an image. I've been working that in reverse in terms of I will Give them an image and expect text back.

Be it something like, imagine you're trying to go through your Lightroom catalogue, and put those in the categories. Maybe they're by colour, or maybe it's like style, perhaps it's like landscapes, or you've got pictures of your family, that kind of stuff. And doing this manually can take a [00:03:00] while.

I've been trying to think about ways I can use this to give me a leg up on my photo processing stuff. Now, what I did notice is a lot of the GUIs I was working with were built with something called Gradio. It would say on the bottom, UI develops are brought to you by Gradio. And I was thinking, this is pretty handy.

A lot of this, code, like the code that I'm working with, these code bases are in Python, which I can typically muddle my way through. It's not too bad. I know a little bit about Python so I can typically follow along. Where I get lost. So it was on the front end, and I've tried to make my own.

I've been playing around a lot with Bun and Hono to do this kind of stuff. Can I quickly, rapidly make a text box that has an input, output, that kind of thing? And then I realized, maybe I should actually try Gradio, like all the other cool kids are using. What are they actually doing here? Now, Gradio, they say, will help you build and share delightful machine learning apps.

I'm going to put a finer pin on this, in that, if the GUI that you're trying to build has something like an input field and then it's got like a submit response kind of thing and expects text or an image or something to go somewhere. This GUI might be perfect for that kind [00:04:00] of thing.

Now you can see there's radio buttons and sliders and stuff like that you can use. But the nice thing is it's just a library that you can actually install pretty quickly. So if we were to, Swift this to the side. The installation is something is I'll make this a little bit bigger. My apologies as a pip install, which actually makes it quite simple.

Now there's one caveat here and that if you're using system python, you'll probably want to install this in a virtual environment, which is what I've done here. So to install in the virtual environment. We create a virtual environment. We called it Gradio Env.

And then to source it, all I did was type source Gradio bin activate. And then within there, just a pip install Gradio. We'll actually get the package for you. Now you can see in this case, it's already been satisfied because I've already installed it. But one way to test that it's been installed is to type in Python or in my case, Python 3.

And then what we can actually do is if we go through this quick start here, we can start importing Gradio. So if we do this. Import Gradio as GR, which I'm going to [00:05:00] do. And this is just in the Python REPL. I think this is what I want. So from Gradio, what I want to get is the version. And if it's installed properly, this should return the version number. It does. I had 5. 16 installed. I've just gone up to 5. 18. I'm sorry, 5.

17. I'm just going to exit here. So what we're going to do is create a first app. Jason, have you dealt with HuggingFace before? Oh yeah. Yeah. Hugging face is true. And what I noticed is part of this Gradio, the promise I guess is to be able to do things like take spaces like this that you might see in Hugging Space and deploy them locally, which is actually pretty interesting to me.

Not only because I could have them on one computer in my household that's got like a graphics card on it or what have you, but also because I could share them to people outside of my own computer. So if I got something running that I thought was pretty cool, I might be able to send Jason a link and see if he can play around with it.

So in that vein, I guess what we're going to do is grab one of these spaces here and create a quick sample page and see if we can't share it to Jason. Now what I [00:06:00] noticed in this launch here is that there's actually a share equals true parameter that will allow us to share it around. And I noticed this in troubleshooting it, it actually said, Hey, if you want this GUI to be shared amongst multiple people and multiple computers.

All you need to do is just change this at the bottom, which is pretty cool. So when you first launch it, it will give you that tip. What we're going to do is copy this code. And you can see that it's pointing to this question answering space. So if we go into here, and we change the space. 

So we were looking at the diff text space. And what I'm going to do is just change it to this so we can see a preview of what we're trying to launch locally. So something like this. Now I've got this in dark mode. Of course, it could be in light mode as well. But we're going to try to launch this locally using this here.

So I'm going to grab this code, and I'm going to pop it onto a Python file. I've made one already, but basically we just go into here, delete all this out, paste this in. And then I think all I need to do in here is sure equals uppercase true. And I believe this is it. [00:07:00] This is my understanding.

So Python 3, we'll do main. py. And when this runs, it should tell me that it's running locally, which is pretty handy. But also, it's running on this public URL, which is pretty interesting. So Jason, I'm going to pop this into my browser here, but also in the chat on our end. I'm going to send you a link and see if that works for you.

You can see on my end it did load. So it loaded that public URL for my internal web server and that didn't take very long. I don't know, five minutes, that kind of thing, which is pretty impressive actually for me to do this.

And something like Bonner Hondo would probably take me, I don't know, half an hour. I'm not that great with JavaScript, but, it takes me a little bit of time to get my head around front end stuff. 

[00:07:42] **Jason Hand:** Yeah I feel like most times I have a use case for that where I need a front end, I'm definitely turning to.

Chat, GPT co pilot something and just Hey, give me some quick HTML, to just basically capture something and then do something else with it. But now, yeah, there's other tools out there too, [00:08:00] that help make interfaces just like a simple interface, but this is pretty cool.

[00:08:03] **Ryan MacLean:** Hey, look at that. And yours is in light mode, so we know it's different. Now, if you hit submit, does that actually work? Oh, very interesting. Not bad. All right. Okay. So we give it some text, we give it a question and give us an answer.

But this is just one of the spaces that we were looking at in hugging Face. Hugging Face. Which is great. We can use many. 

[00:08:29] **Jason Hand:** Yeah, I feel like, to describe Hugging Face, I honestly think Hugging Space is going to turn into a really great source for a lot of the tools that we'll probably play with, or I know that I want to play with.

Every time I go in there and browse around there's all kinds of stuff. It's like a, marketplace. It feels like that, doesn't it? 

[00:08:46] **Ryan MacLean:** Yeah, there's leaderboards and some challenges and things like that too.

You can upload your own models as well and see how they fare in like a fight against a whole bunch of other ones. What I find interesting is some of their, the way that they rate models [00:09:00] is it's like double blind. So you won't know what you're rating. And the other person won't know either, but you're just rating the, what you thought of the response and as a result, maybe not double blind, maybe blind is what I'm looking for, but you're not aware of what you're rating for the rankings, which I think is pretty good.

That way it's not like your emotions are involved, I guess is what I was looking for. 

[00:09:18] **Jason Hand:** If you go into HuggingFace and just grab a completely different, what they're called, space. 

[00:09:23] **Ryan MacLean:** Yep. 

[00:09:24] **Jason Hand:** And inside the code, just replace that one little line of text. 

In the Python with this other space, you'll get a completely different interface. 

I think you might be right. Let's find it. So Gradio is who we want. Let's go back here. So this is from Greedio. Let's click into there. But even if you go into just, HuggingFace, I think, slash Spaces, right? That's where all the groups of spaces are. 

[00:09:47] **Ryan MacLean:** Oh, My Abilities. Let's try this. Yeah, there we go. Okay, so if we look for something Let's look for Image Generation. FlexDev. Okay, this is pretty good. And it's running on zero, so [00:10:00] you're saying, you think, that I can just grab this.



[00:10:03] **Jason Hand:** Is how I understood 

[00:10:04] **Ryan MacLean:** 

[00:10:04] **Jason Hand:** Which I think, to me, is like the big, selling point, 

[00:10:08] **Ryan MacLean:** I hear ya. And I'd actually only been using big radio spaces. I hadn't thought of what I could do if I did it this way.

Okay, that's pretty interesting. Now, again, I'm going to use this just because I'm running this on a Linux box that is in fact under my desk. But let's hit this live one here. 

Mandolin.

Okay. I think this should be fine. So all I did was type in, my apologies, the prompt is pretty small here, but someone playing Mendolin in a field. And this is using that URL that I've exposed publicly. So if you're watching this recording within 72 hours, perhaps you could hit it too. It is starting up now.

It is pretty slow. Now what we're using is Flux One Pro. I've used Dev before. It's actually a pretty good model for generating images. I've not used Pro, but I've heard it's quite good. 

Okay. Who does it and think of it as kinda like a mid journey. Oh, [00:11:00] wow. What I ne I typed in someone on purpose just to see what it would do here. This is okay. Now listen, I'm not an expert, but is that the right amount of strings? 

[00:11:12] **Jason Hand:** 

[00:11:12] **Ryan MacLean:** have eight strings? 

[00:11:12] **Jason Hand:** Have eight strings. 

[00:11:13] **Ryan MacLean:** Now I can't count eight strings. 

[00:11:15] **Jason Hand:** is more of a guitar. Okay. It looks like they're playing it with their fingers, which not typically. 

[00:11:20] **Ryan MacLean:** 

[00:11:20] **Jason Hand:** hands look 

[00:11:21] **Ryan MacLean:** all 

[00:11:21] **Jason Hand:** The left hand, the index fingers. 

[00:11:24] **Ryan MacLean:** Does look 

[00:11:24] **Jason Hand:** a little 

[00:11:24] **Ryan MacLean:** yeah, maybe I'm playing too much Mandalorian. 

[00:11:25] **Jason Hand:** Really big thumb 

[00:11:27] **Ryan MacLean:** It's a very long thumb. In terms of sharing something though, I will say this is pretty fast.



[00:11:32] **Jason Hand:** An app, basically, 

[00:11:33] **Ryan MacLean:** that 

[00:11:33] **Jason Hand:** In 

[00:11:34] **Ryan MacLean:** the past, 

[00:11:36] **Jason Hand:** I 

[00:11:37] **Ryan MacLean:** probably used Bootstrap, if we're being serious here. Tailwind, just basically other tools that can help me get to a point that I like. And in fact, if it was just a form and response kind of thing, I probably can that and use it for everything.

I'd use the same app for all the stuff. I wouldn't change it. Boilerplate, go through it. So the fact that somebody has done that part for me already is actually pretty interesting. So I don't have to do that. myself. 

[00:11:58] **Jason Hand:** Can we inspect the code [00:12:00] for one of these apps? Let's see what it looks like behind the scenes because in terms of instrumenting it, that's where my next thought goes.



[00:12:09] **Ryan MacLean:** Sure. So I got a hint of Vite, at least when I was looking through the code, but I think that's just for the, is that bundling for JS? 

Okay, but I'll quickly go through the code here. What do we start with? There's a viewport.

Bunch of text. I'm just looking for anything that sticks out. Not seeing any frameworks just yet or anything like that. It does have Google Analytics turned on, which is interesting. Or analytics anyway. Which is I probably want to do that too. It says there's radio analytics, okay. We're scrolling down a bit.

Interesting. So I think what I'm noticing in here is that there's other properties that I'm not using, like a streamable, for example, instead of waiting for your text, you could have it stream through. 

A lot of this is just setting up the, the [00:13:00] boilerplate. I'm just skipping through here to see if I see anything that sticks out.

But a lot of this is just JSON setting up the boilerplate template. Using Google Fonts, Something called iFrame Resizer. And this is maybe doing the heavy lifting right here is this JavaScript. 

[00:13:16] **Jason Hand:** You looked at, if you like, could do a diff between this scene and the other scene, oh, what's actually being changed each time. 

[00:13:24] **Ryan MacLean:** my assumption is that the JSON payload would change for sure, like telling you how it sets up the form. So this here would change. But I feel like the rest of this is probably boilerplate.

The rest of this stuff seems like it's just standard. This is our image. It came through as a WebP, which is cool. This is our iframe resizer.

This is probably our font. It is. Here's our Gradio.

Not seeing anything obvious in here. Okay. So there's quite a few things that we could have used. There's an accordion. There's a slider. [00:14:00] Single page. Okay, so there's a bunch of little components here as well that looking at this now tells me I could have used. okay, there's nothing else in here, I don't think.

you could probably instrument this thing with at least 

Yeah, in fact, there's stuff in here, but I, okay, so it's svelte. There we go. Svelte. So it's svelte, and I wonder if it's svelte kit. Okay, very cool. So many parameters provided. Okay, and it's TypeScript.

Alright, so there might be some stuff in here you could play around with for sure. So Lighthouse will load that page and this is Google's kind of SEO Sort of thing if I were to expose this to the public and make a real app out of it I'd want to start at least looking at these kind of metrics This is assuming the page loads like what I'm looking for a lot of times is Hey, does the page load in between versions?

Have I made it slower? Does it actually work if I change a single line of code Does it still load those are the issues that I [00:15:00] have when developing something like this, a silly front end. I think as you're going towards into something that you're going to use in prod, you probably want to start paying attention to these metrics.

The performance of the app, the best practices, but basically, looking at this, it looks like the first contentful paint is pretty slow. So that's, when it started to load the page itself, how long did it take? To load the largest in terms of what is the largest area it loaded, which I think were those text boxes took 12 seconds, which is not great.

And then the speed index itself, just on total time was about 5. 4. This is without even sending something off. So it's probably the hugging face is very popular and a lot of people are using this kind of stuff. So it's slow as a result, but it might be interesting to. Compare and contrast this hosted in different regions or different zones or like internally versus externally.

There's a bunch of stuff we could do here in terms of metrics to ensure that like you're maybe deploying to an area where your users are or get the best experience. I guess those kind of metrics are interesting to me.[00:16:00] 

[00:16:01] **Jason Hand:** Cool. Another player in the space. Definitely makes life easier. I can see for experimenting with. Some different ideas. So if I was to come to you and I already know the answer it depends, Fair enough. But if I was to come to you and say, why do I need Grado?

Why would I use Grado? What's your response to that? 

[00:16:21] **Ryan MacLean:** Yeah. I guess the first question would be like, how comfortable are you with front ends? I think the use case I saw online is hey, as an API developer, does your PM often get confused about the features you're delivering?

What if you could slap a front end on it that would show them what it's doing without necessarily diving into the terminal? for me, it's like back end devs who need a quick front end that doesn't need to be all singing, all dancing. 

[00:16:45] **Jason Hand:** Yeah, and I think quick front end is the, is the part there.

This isn't something that you're going to build a whole app on. This is to get something off the ground. An MVP, but beyond that, it doesn't seem like it's going to change the world.

[00:16:59] **Ryan MacLean:** No, [00:17:00] yeah, and there are components like you could build an app around this But again, it's probably gonna have that same look and feel so getting outside of this look and feel might be tough And the other is like it's got some components, but it doesn't have the components that you'd expect from some of the other frameworks.

I looked at another one called Streamlit, which I think is from, Snowflake, for example, which is similar, but their goal is to show you data really quickly, or show you widgets to allow you to pivot your spreadsheet, or if you want to look at freezing a row or freezing a column, or maybe excluding things from a graph to see what would happen, that kind of thing seems to be what Streamlit is.

curious about, or trying to solve for. What's interesting to me is that they both are intersecting at this point, where it's load an LLM model and visualize, which seems to be a goal that they both have, as well as they've gone into that rapid application development space, and they both have pros and cons on their end as well.

We've got LLMs, we've got data, we've got gobs of assumptions, about how these things may react with the GUI in [00:18:00] front of them. A lot of times what we're trying to do is figure out is this an app?

What can I do to quickly cobble something together to have other people play around with it? 

[00:18:07] **Jason Hand:** I think this has been a great first pick for a new tool in our little AI lab experiments and related tools. As we mentioned earlier, I've got this list, top of my list is Cursor, and I started to install it earlier and Ryan excitedly pointed out that some of the most fun parts of discovery with this app is like the questions it asks you at the beginning, 

[00:18:33] **Ryan MacLean:** Yeah, that onboarding experience to me is interesting in these tools. 

[00:18:36] **Jason Hand:** Yeah, so we will. Include that in the process. I don't know if the same wizard will pop up when I open it up again next time, but.

[00:18:44] **Ryan MacLean:** I just want to know about, how much you love Emacs. That's all. 

[00:18:47] **Jason Hand:** I really don't have an opinion on Emacs. I think I've probably used it less than five times ever. Fair enough. And, it was fine. But, like you, I enjoy The experience of Vim, the text world. And when I'm [00:19:00] not in there, it's VS Code usually.

But now we got Cursor and some other stuff out there. So that's what we're going to play with. 

[00:19:06] **Ryan MacLean:** Absolutely. 

[00:19:07] **Jason Hand:** Next time for me. I think that's probably a good place to stop this recording. And we'll share it amongst, our group. Get some feedback and see what we can do to help you all understand this stuff.

Moving forward, make sure we're helping each other advance, our understanding. And like I said earlier, keep tabs on each other and protect each other a little bit too. 

[00:19:30] **Ryan MacLean:** Keeping safety in mind, yeah. 

[00:19:31] **Jason Hand:** Yeah, I think it's just, something that's on top of my mind. I think the more we know about these things and how to, they're here to stay.

So people are putting these things into our stacks, integrating them into our applications. Which means the part of day to day, life for all of us in some ways, and I think it's naive to just ignore them and say it's somebody else's problem. 

It's all part of the same thing. So it's good for us all to just have an understanding these [00:20:00] tools. What's out there? Why would you use them? Are they helpful? And that's what we're here to do is share what we find out in that effort. 

[00:20:06] **Ryan MacLean:** Super excited to see you see, Cursor. 

[00:20:09] **Jason Hand:** I'm excited to play with it. So we'll do that for the next one, and we'll see y'all then. 

[00:20:14] **Ryan MacLean:** Bye, folks. 

[00:20:14] **Jason Hand:** See ya.

