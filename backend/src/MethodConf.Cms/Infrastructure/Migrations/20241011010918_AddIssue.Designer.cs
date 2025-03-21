﻿// <auto-generated />
using System;
using MethodConf.Cms.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace MethodConf.Cms.Infrastructure.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20241011010918_AddIssue")]
    partial class AddIssue
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.7");

            modelBuilder.Entity("MethodConf.Cms.Domain.Issue", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<Guid>("ConferenceId")
                        .HasColumnType("TEXT");

                    b.Property<string>("Email")
                        .HasMaxLength(255)
                        .HasColumnType("TEXT");

                    b.Property<string>("Message")
                        .IsRequired()
                        .HasMaxLength(10000)
                        .HasColumnType("TEXT");

                    b.Property<string>("Name")
                        .HasMaxLength(255)
                        .HasColumnType("TEXT");

                    b.Property<string>("PhoneNumber")
                        .HasMaxLength(255)
                        .HasColumnType("TEXT");

                    b.Property<string>("Resolution")
                        .HasMaxLength(10000)
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Issues");
                });

            modelBuilder.Entity("MethodConf.Cms.Domain.SessionFeedback", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("TEXT");

                    b.Property<string>("Comments")
                        .HasMaxLength(10000)
                        .HasColumnType("TEXT");

                    b.Property<int>("ContentRating")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Email")
                        .HasMaxLength(255)
                        .HasColumnType("TEXT");

                    b.Property<string>("Name")
                        .HasMaxLength(255)
                        .HasColumnType("TEXT");

                    b.Property<Guid>("SessionId")
                        .HasColumnType("TEXT");

                    b.Property<int>("SpeakerRating")
                        .HasColumnType("INTEGER");

                    b.Property<int>("VenueRating")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.ToTable("SessionFeedback");
                });
#pragma warning restore 612, 618
        }
    }
}
